import type { CSSProperties } from 'react';

export const panelStyle: CSSProperties = {
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

export const collapsedStyle: CSSProperties = {
  ...panelStyle,
  width: 'auto',
  padding: 0,
  overflowY: 'visible',
};

export const titleStyle: CSSProperties = {
  margin: '0 0 10px',
  fontSize: '18px',
  fontWeight: 700,
};

export const sectionStyle: CSSProperties = {
  borderTop: '1px solid #d0d0d0',
  paddingTop: '10px',
  marginTop: '10px',
};

export const sectionTitleStyle: CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: 700,
};

export const rowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

export const buttonStyle: CSSProperties = {
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

export const activeButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: '#111',
  color: '#fff',
};

export const toggleButtonStyle: CSSProperties = {
  ...buttonStyle,
  width: '100%',
  background: '#111',
  color: '#fff',
};

export const checkboxLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '6px',
  fontSize: '15px',
  fontWeight: 600,
};

export const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
};

export const closeButtonStyle: CSSProperties = {
  ...buttonStyle,
  minWidth: '34px',
  padding: '4px 8px',
};

export const collapsedToggleStyle: CSSProperties = {
  ...toggleButtonStyle,
  borderRadius: '4px',
  minWidth: '112px',
};
