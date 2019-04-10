import React, { Component } from 'react';
import Singleton from 'react-singleton';
import './imageViewer.less';

class ImageViewer extends Component {
  constructor(props) {
    super();
    this.state = {
      curNum: props.curNum,
      start1X: null,
    };
  }

  handleNext = () => {
    const { curNum } = this.state;
    const { list = [], } = this.props;
    const l = list.length;
    this.setState({ curNum: curNum >= l - 1 ? curNum : curNum + 1 });
  }

  handlePrev = () => {
    const { curNum } = this.state;
    this.setState({ curNum: curNum <= 0 ? curNum : curNum - 1 });
  }

  _handleTouchStart(e) {
    const touch = e.touches[0];
    this.setState({ start1X: touch.pageX }, () => {
      
    });
  }

  _handleTouchMove() {

  }

  _handleGestureStart() {
    console.log(arguments);
    this.handleNext()
  }

  _handleTouchEnd(e) {
    const { start1X } = this.state;
    const touch = e.changedTouches[0];
    const diff = start1X - touch.pageX;
    if (start1X !== null && Math.abs(diff) >= 30) {
      diff > 0 ? this.handleNext() : this.handlePrev();
    }
    this.setState({ start1X: null });
  }

  componentDidMount() {
    document.addEventListener('gesturestart', this._handleGestureStart);
  }

  render() {
    const { curNum } = this.state;
    const { list = [], showNum, onlyBtnClose, close, maxScale, detailList } = this.props;
    const closeIcon = <svg width="32px" height="32.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M810.666667 273.493333L750.506667 213.333333 512 451.84 273.493333 213.333333 213.333333 273.493333 451.84 512 213.333333 750.506667 273.493333 810.666667 512 572.16 750.506667 810.666667 810.666667 750.506667 572.16 512z" /></svg>;
    const w = window.screen.width || window.innerWidth;
    const h = window.screen.height || window.innerHeight;
    const curImg = detailList[curNum];
    const curHeight = Math.round(w / curImg.naturalWidth * curImg.naturalHeight);

    return (
      <div className="imageview"
        onTouchStart={this._handleTouchStart.bind(this)}
        onTouchEnd={this._handleTouchEnd.bind(this)}>
        <div className="images" style={{ transform: `translateX(${-w * curNum}px)`, overflowY: curHeight > h ? 'auto' : 'initial', overflowX: curHeight > h ? 'hidden' : 'initial' }}>
        {
          detailList.map((item, k) => {
            const { naturalHeight, naturalWidth, src } = item;
            const height = Math.round(w / naturalWidth * naturalHeight);
            return <img style={{ left: w * k, top: height >= h ? 0 : (h - height) / 2 }} key={src} 
              className="image-item" src={src} alt="image" />
      }
    )
  }
        </div>
        {showNum && <div className="imageNumbers">{`${curNum + 1} / ${list.length}`}</div>}
        {onlyBtnClose && <div onClick={close} className="closeBtn">{closeIcon}</div>}
      </div>
    )
  }
}

export const SingleImgView = new Singleton(ImageViewer);

export default SingleImgView;