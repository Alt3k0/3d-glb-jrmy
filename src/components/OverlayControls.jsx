import React from 'react';

export default function OverlayControls() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Contrôles</h2>
      <ul style={styles.list}>
        <li><strong>ZQSD</strong> — Se déplacer</li> 
        <li><strong>Clic gauche</strong> — Attraper les pommes de pins</li>
        <li><strong>F</strong> — Poser / interagir</li>
      </ul>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'rgba(0, 0, 0, 0.6)',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    zIndex: 1000,
    maxWidth: '200px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '18px',
  },
  list: {
    padding: 0,
    margin: 0,
    listStyle: 'none',
    fontSize: '14px',
    lineHeight: '1.5',
  },
};