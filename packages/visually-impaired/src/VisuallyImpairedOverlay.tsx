import React, { useState } from 'react';
import {
  type ColorScheme,
  type FontSizeLevel,
  type ImageMode,
  type LetterSpacingLevel,
  type LineHeightLevel,
  useVisuallyImpaired,
} from './useVisuallyImpaired';

export interface VisuallyImpairedOverlayProps {
  defaultOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const FONT_LABELS: Record<FontSizeLevel, string> = {
  normal: '100%',
  large: '125%',
  xlarge: '150%',
};

const LINE_HEIGHT_LABELS: Record<LineHeightLevel, string> = {
  normal: '1.5',
  wide: '1.7',
  extra: '2.0',
};

const COLOR_LABELS: Record<ColorScheme, string> = {
  default: 'Сайт',
  'white-black': 'Белый',
  'black-white': 'Черный',
  'blue-yellow': 'Синий',
  'beige-brown': 'Бежевый',
};

const IMAGE_LABELS: Record<ImageMode, string> = {
  normal: 'Как есть',
  grayscale: 'Ч/б',
  hidden: 'Скрыть',
};

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  zIndex: 2147483647,
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '260px',
  maxWidth: 'calc(100vw - 24px)',
  maxHeight: 'calc(100vh - 24px)',
  overflowY: 'auto',
  boxSizing: 'border-box',
  border: '2px solid #111',
  borderRadius: '6px',
  background: '#fff',
  color: '#111',
  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.25)',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: 1.35,
  padding: '12px',
};

const collapsedStyle: React.CSSProperties = {
  ...panelStyle,
  width: 'auto',
  padding: 0,
  overflow: 'visible',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: '18px',
  fontWeight: 700,
};

const sectionStyle: React.CSSProperties = {
  borderTop: '1px solid #d0d0d0',
  paddingTop: '10px',
  marginTop: '10px',
};

const sectionTitleStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: 700,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

const buttonStyle: React.CSSProperties = {
  border: '2px solid #111',
  borderRadius: '4px',
  background: '#fff',
  color: '#111',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 700,
  minHeight: '34px',
  padding: '5px 8px',
};

const activeButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#111',
  color: '#fff',
};

const toggleButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  width: '100%',
  background: '#111',
  color: '#fff',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '6px',
  fontSize: '15px',
  fontWeight: 600,
};

function OptionButton<T extends string>({
  value,
  active,
  children,
  onClick,
}: {
  value: T;
  active: boolean;
  children: React.ReactNode;
  onClick: (value: T) => void;
}) {
  return (
    <button
      type="button"
      style={active ? activeButtonStyle : buttonStyle}
      aria-pressed={active}
      onClick={() => onClick(value)}
      data-ru-a11y-vi-overlay
    >
      {children}
    </button>
  );
}

export function VisuallyImpairedOverlay({
  defaultOpen = false,
  className,
  style,
}: VisuallyImpairedOverlayProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { settings, setSettings, reset, isEnabled, toggle } = useVisuallyImpaired();

  if (!open) {
    return (
      <aside
        className={className}
        style={{ ...collapsedStyle, ...style }}
        aria-label="Панель версии для слабовидящих"
        data-ru-a11y-vi-overlay
      >
        <button
          type="button"
          style={{ ...toggleButtonStyle, borderRadius: '4px', minWidth: '112px' }}
          onClick={() => setOpen(true)}
          aria-expanded="false"
          data-ru-a11y-vi-overlay
        >
          Версия
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={className}
      style={{ ...panelStyle, ...style }}
      aria-label="Панель версии для слабовидящих"
      data-ru-a11y-vi-overlay
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <h2 style={titleStyle}>Версия для слабовидящих</h2>
        <button
          type="button"
          style={{ ...buttonStyle, minWidth: '34px', padding: '4px 8px' }}
          onClick={() => setOpen(false)}
          aria-label="Свернуть панель"
          data-ru-a11y-vi-overlay
        >
          x
        </button>
      </div>

      <button
        type="button"
        style={toggleButtonStyle}
        aria-pressed={isEnabled}
        onClick={toggle}
        data-ru-a11y-vi-overlay
      >
        {isEnabled ? 'Выключить полный режим' : 'Полный режим'}
      </button>

      <div style={sectionStyle}>
        <span style={sectionTitleStyle}>Размер текста</span>
        <div style={rowStyle}>
          {(['normal', 'large', 'xlarge'] as FontSizeLevel[]).map((value) => (
            <OptionButton
              key={value}
              value={value}
              active={settings.fontSize === value}
              onClick={(fontSize) => setSettings({ fontSize })}
            >
              {FONT_LABELS[value]}
            </OptionButton>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={sectionTitleStyle}>Интервал</span>
        <div style={rowStyle}>
          {(['normal', 'wide', 'extra'] as LineHeightLevel[]).map((value) => (
            <OptionButton
              key={value}
              value={value}
              active={settings.lineHeight === value}
              onClick={(lineHeight) => setSettings({ lineHeight })}
            >
              {LINE_HEIGHT_LABELS[value]}
            </OptionButton>
          ))}
          <OptionButton<LetterSpacingLevel>
            value={settings.letterSpacing === 'wide' ? 'normal' : 'wide'}
            active={settings.letterSpacing === 'wide'}
            onClick={(letterSpacing) => setSettings({ letterSpacing })}
          >
            Буквы
          </OptionButton>
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={sectionTitleStyle}>Цвет</span>
        <div style={rowStyle}>
          {(['default', 'white-black', 'black-white', 'blue-yellow', 'beige-brown'] as ColorScheme[]).map((value) => (
            <OptionButton
              key={value}
              value={value}
              active={settings.colorScheme === value}
              onClick={(colorScheme) => setSettings({ colorScheme })}
            >
              {COLOR_LABELS[value]}
            </OptionButton>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={sectionTitleStyle}>Ссылки</span>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={settings.underlineLinks}
            onChange={(event) => setSettings({ underlineLinks: event.currentTarget.checked })}
            data-ru-a11y-vi-overlay
          />
          Подчеркивать
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={settings.highlightLinks}
            onChange={(event) => setSettings({ highlightLinks: event.currentTarget.checked })}
            data-ru-a11y-vi-overlay
          />
          Выделять цветом
        </label>
      </div>

      <div style={sectionStyle}>
        <span style={sectionTitleStyle}>Изображения</span>
        <div style={rowStyle}>
          {(['normal', 'grayscale', 'hidden'] as ImageMode[]).map((value) => (
            <OptionButton
              key={value}
              value={value}
              active={settings.imageMode === value}
              onClick={(imageMode) => setSettings({ imageMode })}
            >
              {IMAGE_LABELS[value]}
            </OptionButton>
          ))}
        </div>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={settings.showImageAlt}
            onChange={(event) => setSettings({ showImageAlt: event.currentTarget.checked })}
            data-ru-a11y-vi-overlay
          />
          Подписи alt
        </label>
      </div>

      <div style={sectionStyle}>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => setSettings({ reducedMotion: event.currentTarget.checked })}
            data-ru-a11y-vi-overlay
          />
          Отключить анимации
        </label>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={settings.strongFocus}
            onChange={(event) => setSettings({ strongFocus: event.currentTarget.checked })}
            data-ru-a11y-vi-overlay
          />
          Усилить фокус
        </label>
      </div>

      <div style={sectionStyle}>
        <button type="button" style={buttonStyle} onClick={reset} data-ru-a11y-vi-overlay>
          Сбросить
        </button>
      </div>
    </aside>
  );
}

export default VisuallyImpairedOverlay;
