import React from 'react';
import './StageSofiaDialog.css';

const sofiaPortrait = new URL('../../rsc/images/facesets/Sofia_ZoomFace.png', import.meta.url).href;

type StageSofiaDialogProps = {
  isVisible: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const StageSofiaDialog: React.FC<StageSofiaDialogProps> = ({
  isVisible,
  message,
  confirmLabel = 'Entendi',
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  const DIALOG_CLOSE_MS = 220;
  const closeTimeoutRef = React.useRef<number | null>(null);
  const [shouldRender, setShouldRender] = React.useState(isVisible);
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    if (isVisible) {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (!shouldRender) {
      return;
    }

    setIsClosing(true);
    closeTimeoutRef.current = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
      closeTimeoutRef.current = null;
    }, DIALOG_CLOSE_MS);
  }, [isVisible, shouldRender]);

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`stage-sofia-dialog${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="Mensagem da Sofia">
      <div className="stage-sofia-dialog-backdrop" />
      <div className="stage-sofia-dialog-card">
        <div className="stage-sofia-guide">
          <img src={sofiaPortrait} alt="Sofia" className="stage-sofia-guide-portrait" />
          <div className="stage-sofia-speech-bubble">
            <div className="stage-sofia-speech-head">
              <h3>Sofia</h3>
              <span>Produtora da Hero Music</span>
            </div>
            <p>{message}</p>
          </div>
        </div>

        <div className="stage-sofia-dialog-actions">
          {cancelLabel && onCancel ? (
            <button
              type="button"
              className="stage-sofia-dialog-btn secondary"
              onClick={onCancel}
              data-click-sfx="cancel"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="stage-sofia-dialog-btn primary"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageSofiaDialog;
