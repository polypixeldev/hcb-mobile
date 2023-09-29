import { Ionicons } from "@expo/vector-icons";
import { MenuView } from "@react-native-menu/menu";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { FlatList, Pressable, useColorScheme } from "react-native";
import useSWR from "swr";

import PaymentCard from "../components/PaymentCard";
import listPreloader from "../lib/listPreloader";
import { CardsStackParamList } from "../lib/NavigatorParamList";
import Card from "../lib/types/Card";
import { palette } from "../theme";

type Props = NativeStackScreenProps<CardsStackParamList, "CardList">;

export default function CardsPage({ navigation }: Props) {
  const { data: cards } = useSWR<(Card & Required<Pick<Card, "last4">>)[]>(
    "/user/cards",
    {
      use: [listPreloader<Card>((c) => `/cards/${c.id}`)],
    },
  );
  const tabBarHeight = useBottomTabBarHeight();
  const scheme = useColorScheme();

  const [frozenCardsShown, setFrozenCardsShown] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MenuView
          actions={[
            {
              id: "showFrozenCards",
              title: "Show inactive cards",
              state: frozenCardsShown ? "on" : "off",
            },
          ]}
          onPressAction={({ nativeEvent: { event } }) => {
            if (event == "showFrozenCards") {
              setFrozenCardsShown((x) => !x);
            }
          }}
          themeVariant={scheme || undefined}
        >
          <Ionicons.Button
            name="ellipsis-horizontal-circle"
            backgroundColor="transparent"
            size={24}
            color={palette.primary}
          />
        </MenuView>
      ),
    });
  }, [navigation, frozenCardsShown]);

  if (cards) {
    return (
      <FlatList
        data={
          frozenCardsShown ? cards : cards.filter((c) => c.status == "active")
        }
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 20,
          paddingTop: 20,
        }}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        // onRefresh={() => refresh()}
        // refreshing={isValidating}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Card", {
                cardId: item.id,
                last4: item.last4,
              })
            }
          >
            <PaymentCard
              card={item}
              style={{ marginHorizontal: 20, marginVertical: 8 }}
            />
          </Pressable>
        )}
      />
    );
  }
}
