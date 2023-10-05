import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";

import { StackParamList } from "../../../lib/NavigatorParamList";
import { TransactionCheck } from "../../../lib/types/Transaction";
import { renderMoney } from "../../../util";
import UserMention from "../../UserMention";
import TransactionDetails, { descriptionDetail } from "../TransactionDetails";
import TransactionTitle, { Muted } from "../TransactionTitle";

import { TransactionViewProps } from "./TransactionViewProps";

export default function CheckTransaction({
  transaction: { check, ...transaction },
  ...props
}: TransactionViewProps<TransactionCheck>) {
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamList, "Transaction">>();

  return (
    <View>
      <TransactionTitle>
        {renderMoney(Math.abs(transaction.amount_cents))}{" "}
        <Muted>check to</Muted> {check.recipient_name}
      </TransactionTitle>
      <TransactionDetails
        details={[
          descriptionDetail(props.orgId, transaction, navigation),
          ...(check.sender
            ? [{ label: "Sent by", value: <UserMention user={check.sender} /> }]
            : []),
        ]}
      />
    </View>
  );
}
