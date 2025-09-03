import BattleMessages from "../../components/BattleMessages";

type Props = {
  overrideMsg: string | null;
  lastNonEmptyMsg: string;
  lockUI: boolean;
  fallback: string;
};

function MessagesPane({
  overrideMsg,
  lastNonEmptyMsg,
  lockUI,
  fallback,
}: Props) {
  const text =
    overrideMsg && overrideMsg.trim() !== ""
      ? overrideMsg
      : lockUI
      ? lastNonEmptyMsg
      : fallback;

  return <BattleMessages message={text} className="h-full" />;
}

export default MessagesPane;
