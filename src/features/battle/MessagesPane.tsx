import BattleMessages from "../../components/BattleMessages";

type Props = {
  overrideMsg: string | null;
  lastNonEmptyMsg: string;
  lockUI: boolean;
  fallback: string;
  waiting?: boolean;
};

function MessagesPane({
  overrideMsg,
  lastNonEmptyMsg,
  lockUI,
  fallback,
  waiting = false,
}: Props) {
  const text =
    overrideMsg && overrideMsg.trim() !== ""
      ? overrideMsg
      : lockUI
      ? lastNonEmptyMsg
      : fallback;

  return <BattleMessages message={text} className="h-full" waiting={waiting} />;
}

export default MessagesPane;
