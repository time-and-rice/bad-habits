import { ReactNode, useEffect, useRef } from "react";

export function AppModal({
  show,
  onClose,
  children,
}: {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (show) ref.current?.showModal();
    else ref.current?.close();
  }, [show]);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </dialog>
  );
}
