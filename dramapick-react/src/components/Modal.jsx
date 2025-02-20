import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/Modal.module.css';

const Modal = ({ isOpen, onClose, children }) => {
 if (!isOpen) return null;

 return ReactDOM.createPortal(
   <div className={styles.modalOverlay} onClick={onClose}>
     <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
       {children}
       <button onClick={onClose}>닫기</button>
     </div>
   </div>,
   document.body
 );
};

export default Modal;
