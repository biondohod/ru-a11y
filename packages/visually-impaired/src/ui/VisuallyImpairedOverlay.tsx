import { useState, type CSSProperties, type ReactNode } from 'react';
import { useVisuallyImpaired } from '../hooks/settingHooks';
import {
  COLOR_SCHEMES,
  FONT_SIZE_LEVELS,
  IMAGE_MODES,
  LINE_HEIGHT_LEVELS,
  type BooleanSettingKey,
  type ColorScheme,
  type FontSizeLevel,
  type ImageMode,
  type LineHeightLevel,
  type VisuallyImpairedSettings,
} from '../model/settings';
import {
  activeButtonStyle,
  buttonStyle,
  checkboxLabelStyle,
  closeButtonStyle,
  collapsedStyle,
  collapsedToggleStyle,
  headerStyle,
  panelStyle,
  rowStyle,
  sectionStyle,
  sectionTitleStyle,
  titleStyle,
  toggleButtonStyle,
} from './styles';

export interface VisuallyImpairedOverlayProps {
  defaultOpen?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Marks overlay elements so the stylesheet does not restyle the panel itself. */
const OVERLAY_ATTRIBUTE = { 'data-ru-a11y-vi-overlay': true } as const;
const PANEL_LABEL = 'Панель версии для слабовидящих';

const FONT_LABELS: Readonly<Record<FontSizeLevel, string>> = {
  normal: '100%',
  large: '125%',
  xlarge: '150%',
};

const LINE_HEIGHT_LABELS: Readonly<Record<LineHeightLevel, string>> = {
  normal: '1.5',
  wide: '1.7',
  extra: '2.0',
};

const COLOR_LABELS: Readonly<Record<ColorScheme, string>> = {
  default: 'Сайт',
  'white-black': 'Белый',
  'black-white': 'Черный',
  'blue-yellow': 'Синий',
  'beige-brown': 'Бежевый',
};

const IMAGE_LABELS: Readonly<Record<ImageMode, string>> = {
  normal: 'Как есть',
  grayscale: 'Ч/б',
  hidden: 'Скрыть',
};

type SetSettings = (next: Partial<VisuallyImpairedSettings>) => void;

function OptionButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      style={active ? activeButtonStyle : buttonStyle}
      aria-pressed={active}
      onClick={onClick}
      {...OVERLAY_ATTRIBUTE}
    >
      {children}
    </button>
  );
}

/** A labelled group of mutually exclusive options. */
function OptionGroup<T extends string>({
  id,
  title,
  options,
  labels,
  value,
  onChange,
  children,
  footer,
}: {
  id: string;
  title: string;
  options: readonly T[];
  labels: Readonly<Record<T, string>>;
  value: T;
  onChange: (value: T) => void;
  /** Extra controls inside the group. */
  children?: ReactNode;
  /** Controls rendered below the group, within the same section. */
  footer?: ReactNode;
}) {
  const titleId = `ru-a11y-vi-${id}`;

  return (
    <div style={sectionStyle}>
      <span id={titleId} style={sectionTitleStyle}>
        {title}
      </span>
      <div role="group" aria-labelledby={titleId} style={rowStyle}>
        {options.map((option) => (
          <OptionButton key={option} active={value === option} onClick={() => onChange(option)}>
            {labels[option]}
          </OptionButton>
        ))}
        {children}
      </div>
      {footer}
    </div>
  );
}

function Checkbox({
  setting,
  label,
  settings,
  setSettings,
}: {
  setting: BooleanSettingKey;
  label: string;
  settings: VisuallyImpairedSettings;
  setSettings: SetSettings;
}) {
  return (
    <label style={checkboxLabelStyle}>
      <input
        type="checkbox"
        checked={settings[setting]}
        onChange={(event) => setSettings({ [setting]: event.currentTarget.checked })}
        {...OVERLAY_ATTRIBUTE}
      />
      {label}
    </label>
  );
}

/** Ready-made settings panel for site visitors. */
export function VisuallyImpairedOverlay({
  defaultOpen = false,
  className,
  style,
}: VisuallyImpairedOverlayProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { settings, setSettings, reset, isEnabled, toggle } = useVisuallyImpaired();
  const checkboxProps = { settings, setSettings };

  if (!open) {
    return (
      <aside
        className={className}
        style={{ ...collapsedStyle, ...style }}
        aria-label={PANEL_LABEL}
        {...OVERLAY_ATTRIBUTE}
      >
        <button
          type="button"
          style={collapsedToggleStyle}
          onClick={() => setOpen(true)}
          aria-expanded="false"
          {...OVERLAY_ATTRIBUTE}
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
      aria-label={PANEL_LABEL}
      {...OVERLAY_ATTRIBUTE}
    >
      <div style={headerStyle}>
        <h2 style={titleStyle}>Версия для слабовидящих</h2>
        <button
          type="button"
          style={closeButtonStyle}
          onClick={() => setOpen(false)}
          aria-label="Свернуть панель"
          {...OVERLAY_ATTRIBUTE}
        >
          x
        </button>
      </div>

      <button
        type="button"
        style={toggleButtonStyle}
        aria-pressed={isEnabled}
        onClick={toggle}
        {...OVERLAY_ATTRIBUTE}
      >
        {isEnabled ? 'Выключить полный режим' : 'Полный режим'}
      </button>

      <OptionGroup
        id="font-size"
        title="Размер текста"
        options={FONT_SIZE_LEVELS}
        labels={FONT_LABELS}
        value={settings.fontSize}
        onChange={(fontSize) => setSettings({ fontSize })}
      />

      <OptionGroup
        id="spacing"
        title="Интервал"
        options={LINE_HEIGHT_LEVELS}
        labels={LINE_HEIGHT_LABELS}
        value={settings.lineHeight}
        onChange={(lineHeight) => setSettings({ lineHeight })}
      >
        <OptionButton
          active={settings.letterSpacing === 'wide'}
          onClick={() =>
            setSettings({ letterSpacing: settings.letterSpacing === 'wide' ? 'normal' : 'wide' })
          }
        >
          Буквы
        </OptionButton>
      </OptionGroup>

      <OptionGroup
        id="color-scheme"
        title="Цвет"
        options={COLOR_SCHEMES}
        labels={COLOR_LABELS}
        value={settings.colorScheme}
        onChange={(colorScheme) => setSettings({ colorScheme })}
      />

      <div style={sectionStyle}>
        <span style={sectionTitleStyle}>Ссылки</span>
        <Checkbox setting="underlineLinks" label="Подчеркивать" {...checkboxProps} />
        <Checkbox setting="highlightLinks" label="Выделять цветом" {...checkboxProps} />
      </div>

      <OptionGroup
        id="images"
        title="Изображения"
        options={IMAGE_MODES}
        labels={IMAGE_LABELS}
        value={settings.imageMode}
        onChange={(imageMode) => setSettings({ imageMode })}
        footer={<Checkbox setting="showImageAlt" label="Подписи alt" {...checkboxProps} />}
      />

      <div style={sectionStyle}>
        <Checkbox setting="reducedMotion" label="Отключить анимации" {...checkboxProps} />
        <Checkbox setting="strongFocus" label="Усилить фокус" {...checkboxProps} />
      </div>

      <div style={sectionStyle}>
        <button type="button" style={buttonStyle} onClick={reset} {...OVERLAY_ATTRIBUTE}>
          Сбросить
        </button>
      </div>
    </aside>
  );
}

export default VisuallyImpairedOverlay;
