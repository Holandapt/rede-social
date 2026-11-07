import { useState } from "react";
import { followUser, unfollowUser } from "../api/users";
import { getErrorMessages } from "../api/erros";

interface Props {
  userId: number;
  following: boolean; // estado atual, decidido pelo pai
  onChange: (following: boolean) => void; // chamado só quando o pedido deu certo
}

export default function FollowButton({ userId, following, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setBusy(true);
    try {
      if (following) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      onChange(!following);
    } catch (err) {
      setError(getErrorMessages(err)[0] ?? "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={handleClick} disabled={busy}>
        {busy ? "..." : following ? "Deixar de seguir" : "Seguir"}
      </button>
      {error && <small role="alert"> {error}</small>}
    </>
  );
}
