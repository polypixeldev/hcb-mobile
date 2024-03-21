import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { View, Text, ViewProps, StyleSheet } from "react-native";
import { match } from "ts-pattern";

import {
  TransactionCardCharge,
  TransactionType,
  TransactionWithoutId,
} from "../lib/types/Transaction";
import { palette } from "../theme";
import { renderMoney } from "../util";

import UserAvatar from "./UserAvatar";

function transactionIcon({
  code,
  ...transaction
}: TransactionWithoutId): React.ComponentProps<typeof Ionicons>["name"] {
  switch (code) {
    case TransactionType.Donation:
    case TransactionType.PartnerDonation:
      return "heart-outline";
    case TransactionType.Check:
    case TransactionType.IncreaseCheck:
      return "mail-outline";
    case TransactionType.CheckDeposit:
      return "receipt-outline";
    case TransactionType.Disbursement:
      if (transaction.amount_cents > 0) {
        return "add-circle-outline";
      } else {
        return "remove-circle-outline";
      }
    case TransactionType.StripeCard:
    case TransactionType.StripeForceCapture:
      return "card-outline";
    case TransactionType.BankFee:
      return "remove-circle-outline";
    case TransactionType.FeeRevenue:
      return "add-circle-outline";
    case TransactionType.Invoice:
      return "receipt-outline";
    default:
      return "cash-outline";
  }
}

function TransactionIcon({
  transaction,
  hideAvatar,
  hideIcon,
}: {
  transaction: TransactionWithoutId;
  hideAvatar?: boolean;
  hideIcon?: boolean;
}) {
  if (hideIcon) return null;

  if (!hideAvatar && transaction.code == TransactionType.StripeCard) {
    return (
      <UserAvatar
        user={(transaction as TransactionCardCharge).card_charge.card.user}
        size={20}
      />
    );
  } else {
    return (
      <Ionicons
        name={transactionIcon(transaction)}
        color={
          transaction.appearance == "hackathon_grant"
            ? palette.black
            : palette.muted
        }
        size={20}
      />
    );
  }
}

function Transaction({
  transaction,
  top = false,
  bottom = false,
  hideAvatar,
  hideIcon,
  hidePendingLabel,
  hideMissingReceipt,
  style,
}: ViewProps & {
  transaction: TransactionWithoutId;
  top?: boolean;
  bottom?: boolean;
  hideAvatar?: boolean;
  hideIcon?: boolean;
  hidePendingLabel?: boolean;
  hideMissingReceipt?: boolean;
}) {
  const { colors: themeColors } = useTheme();

  return (
    <View
      style={StyleSheet.compose(
        {
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor:
            transaction.appearance == "hackathon_grant"
              ? undefined
              : themeColors.card,
          borderTopLeftRadius: top ? 8 : 0,
          borderTopRightRadius: top ? 8 : 0,
          borderBottomLeftRadius: bottom ? 8 : 0,
          borderBottomRightRadius: bottom ? 8 : 0,
          overflow: "hidden",
        },
        style,
      )}
    >
      {transaction.appearance == "hackathon_grant" && (
        <LinearGradient
          colors={["#e2b142", "#fbe87a", "#e2b142", "#fbe87a"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}

      <TransactionIcon
        transaction={transaction}
        hideAvatar={hideAvatar}
        hideIcon={hideIcon}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 14,
          color:
            transaction.appearance == "hackathon_grant"
              ? palette.black
              : transaction.pending || transaction.declined
              ? palette.muted
              : themeColors.text,
          overflow: "hidden",
          flex: 1,
        }}
      >
        {!hidePendingLabel &&
          (transaction.declined
            ? "Declined: "
            : transaction.pending
            ? "Pending: "
            : "")}
        {match(transaction)
          .with(
            { appearance: "hackathon_grant", has_custom_memo: false },
            () => "💰 Hackathon grant",
          )
          // .with(
          //   {
          //     card_charge: { merchant: { smart_name: P.string } },
          //     has_custom_memo: false,
          //   },
          //   (tx) => tx.card_charge.merchant.smart_name,
          // )
          .otherwise((tx) => tx.memo)
          .replaceAll(/\s{2,}/g, " ")}
      </Text>
      {transaction.missing_receipt && !hideMissingReceipt && (
        <View>
          <Ionicons name="receipt-outline" color={palette.muted} size={18} />
          <Ionicons
            name="alert"
            color={palette.warning}
            style={{ position: "absolute", top: -8, left: -10 }}
            size={18}
          />
        </View>
      )}
      <Text
        style={{
          color:
            transaction.appearance == "hackathon_grant"
              ? palette.black
              : transaction.amount_cents > 0
              ? "#33d6a6"
              : palette.muted,
        }}
      >
        {renderMoney(transaction.amount_cents)}
      </Text>
    </View>
  );
}

export default memo(Transaction);
