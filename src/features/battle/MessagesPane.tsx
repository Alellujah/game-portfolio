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

  return (
    <BattleMessages
      message={text}
      className="h-[104px]" /* taller to fit more lines */
      waiting={waiting}
      /* slightly faster typing and longer dwell */
      speed={24}
      charsPerTick={14}
      autoPageDelay={1400}
    />
  );
}

export default MessagesPane;
