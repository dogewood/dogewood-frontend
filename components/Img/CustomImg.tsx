import React, { useRef, useState, useEffect } from 'react';
import styles from './CustomImg.module.css'

export default function CustomImg({ className = '', src = '' }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false)

  const onLoad = () => {
    setLoaded(true)
  }

  useEffect(() => {
    if (imgRef && imgRef.current?.complete) {
     onLoad();
    }
   }, []);

  return (
    <div className={styles.imgContent}>
      {!loaded && (
        <div className={styles.placeHolder}>
          <img src="/assets/loading.gif" />
        </div>
      )}
      <img
        ref={imgRef}
        className={[styles.nftImg, className].join(' ')}
        style={loaded ? {} : { display: 'none' }}
        src={src}
        onLoad={onLoad}
      />
    </div>
  )
}
