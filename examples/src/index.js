/**********************************************************************************************
 *  This component is designed for Tribe Project in QQ mobile as a Imageviewer
 *  You can use it as a independent component in your App
 *
 *  @ examples  you can find examples in folder examples or README.md
 *
 *  @ param(array)       imagelist: The list of images to view
 *  @ param(bool)        disablePinch: Disable pinch function
 *  @ param(bool)        disableRotate: Disable rotate function
 *  @ param(bool)        disableDoubleTap: Disable double tap function
 *  @ param(function)    longTap: Events called after the long tap
 *  @ param(function)    close: the function to close the viewer
 *
 *  Copyright by nemoliao( liaozksysu@gmail.com), nemo is a member of AlloyTeam in Tencent.
 *
 **********************************************************************************************/
import React, { Component } from 'react'
import AlloyFinger from './libs/alloyfinger.js'
import Transform from './libs/transform.js'
import { CenterImage } from './components.js'
import Singleton from 'react-singleton'

import './index.less'

const MARGIN = 30

class ImageView extends Component {
    static defaultProps = {
        gap: MARGIN,
        current: 0,
        disablePageNum: false,
        closeBtn: false,
        maxScale: 2
    }

    static propTypes = {
        gap: React.PropTypes.number,
        maxScale: React.PropTypes.number,
        current: React.PropTypes.number,
        imagelist: React.PropTypes.array.isRequired,
        disablePageNum: React.PropTypes.bool,
        disablePinch: React.PropTypes.bool,
        enableRotate: React.PropTypes.bool,
        disableDoubleTap: React.PropTypes.bool,
        longTap: React.PropTypes.func,
        close: React.PropTypes.func.isRequired,
        changeIndex: React.PropTypes.func,
        initCallback: React.PropTypes.func
    }

    constructor(props) {
        super();
        this.arrLength = props.imagelist.length;
        this.state = {
            current: props.current
        }
        this.onOrientationChange = this.onOrientationChange.bind(this)
    }

    onOrientationChange(){
        // 方向改变后新的innerHeight生效需要delay
        setTimeout(()=>{
            this.screenWidth = window.innerWidth || window.screen.availWidth;
            this.screenHeight = window.innerHeight ||  window.screen.availHeight;
            this.changeIndex(this.state.current)
        }, 100)
    }

    initScale = 1;
    screenWidth = window.innerWidth || window.screen.availWidth;
    screenHeight = window.innerHeight || window.screen.availHeight;
    list = null;
    ob = null;
    focused = null;

    render() {
        const { closeBtn, disablePageNum, children, gap } = this.props;
        const closeIcon = <svg width="32px" height="32.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M810.666667 273.493333L750.506667 213.333333 512 451.84 273.493333 213.333333 213.333333 273.493333 451.84 512 213.333333 750.506667 273.493333 810.666667 512 572.16 750.506667 810.666667 810.666667 750.506667 572.16 512z" /></svg>;

        return (
            <div className="imageview">
                <AlloyFinger
                    onSingleTap={closeBtn ? function(){} : this.onSingleTap.bind(this)}
                    onPressMove={this.onPressMove.bind(this)}
                    onSwipe={this.onSwipe.bind(this)}>
                    <ul ref={ref => this.list = ref} className="imagelist">
                    {
                        this.props.imagelist.map((item, i) => {
                            return (
                                <li className="imagelist-item" style={{ marginRight: gap + 'px'}} key={"img"+i}>
                                    <AlloyFinger
                                        onPressMove={this.onPicPressMove.bind(this)}
                                        onMultipointStart={this.onMultipointStart.bind(this)}
                                        onLongTap={this.onLongTap.bind(this)}
                                        onPinch={this.onPinch.bind(this)}
                                        onRotate={this.onRotate.bind(this)}
                                        onMultipointEnd={this.onMultipointEnd.bind(this)}
                                        onDoubleTap={this.onDoubleTap.bind(this)}>
                                        <CenterImage id={`view${i}`} className="imagelist-item-img" lazysrc={item} index={i} current={this.state.current}/>
                                    </AlloyFinger>
                                </li>
                            )
                        })
                    }
                    </ul>
                </AlloyFinger>
                {
                    disablePageNum ? null : <div className="page" ref={ref =>  this.page = ref}>{ this.state.current + 1 } / { this.arrLength }</div>
                }
                {
                    closeBtn ? <div onClick={this.onSingleTap.bind(this)} className="closeBtn">{closeIcon}</div> : null
                }
                { children }
            </div>
        )
    }

    componentDidMount() {
        const { current } = this.state,
            { imagelist, initCallback } = this.props;

        this.arrLength = imagelist.length;
        Transform(this.list);
        current && this.changeIndex(current, false);
        this.bindStyle(current);
        initCallback && initCallback();
        window.addEventListener('orientationchange', this.onOrientationChange)
    }

    componentWillUnmount(){
        window.removeEventListener('orientationchange', this.onOrientationChange)
    }

    onSingleTap(){
        this.props.close && this.props.close();
    }

    onPressMove(evt){
        const { current } = this.state;

        this.endAnimation();

        if( !this.focused ){
            if((current === 0 && evt.deltaX > 0) || (current === this.arrLength - 1 && evt.deltaX < 0)){
                this.list.translateX += evt.deltaX / 3;
            }else{
                this.list.translateX += evt.deltaX;
            }
        }

        evt.preventDefault();
    }

    onSwipe(evt){
        const { direction } = evt;

        let { current } = this.state;
        if( this.focused ){
            return false;
        }
        switch(direction) {
            case 'Left':
                current < this.arrLength-1 && ++current && this.bindStyle(current);
                break;
            case 'Right':
                current > 0 && current-- && this.bindStyle(current);
                break;
        }
        this.changeIndex(current)
    }

    onPicPressMove(evt) {
        const { deltaX, deltaY } = evt,
            isLongPic = this.ob.getAttribute('long'),
            { scaleX, width } = this.ob;
        if(this.ob.scaleX <= 1 || evt.touches.length > 1){
            return;
        }

        if(this.ob && this.checkBoundary(deltaX, deltaY)){
            !isLongPic && (this.ob.translateX += deltaX);
            this.ob.translateY += deltaY;
            
            if(isLongPic && scaleX * width === this.screenWidth){
                this.focused = false;
            }else{
                this.focused = true;    
            }
        }else {
            this.focused = false;
        }
        // console.log('translate ',this.ob.translateX, this.ob.translateY);
    }

    onMultipointStart(){
        this.initScale = this.ob.scaleX;
    }

    onPinch(evt){
        if( this.props.disablePinch || this.ob.getAttribute('long')){
            return false;
        }
        this.ob.style.webkitTransition = 'cubic-bezier(.25,.01,.25,1)'

        const { originX, originY } = this.ob, 
            originX2 = evt.center.x - this.screenWidth/2 - document.body.scrollLeft,
            originY2 = evt.center.y - this.screenHeight/2 - document.body.scrollTop;

        this.ob.originX = originX2;
        this.ob.originY = originY2;
        this.ob.translateX = this.ob.translateX + (originX2 - originX) * this.ob.scaleX;
        this.ob.translateY = this.ob.translateY + (originY2 - originY) * this.ob.scaleY;

        this.ob.scaleX = this.ob.scaleY = this.initScale * evt.scale;
    }

    onRotate(evt){
        if( !this.props.enableRotate || this.ob.getAttribute('rate') >= 3.5){
            return false;
        }
        this.ob.style.webkitTransition = 'cubic-bezier(.25,.01,.25,1)'
        this.ob.rotateZ += evt.angle;
    }

    onLongTap(){
        this.props.longTap && this.props.longTap();
    }

    onMultipointEnd(evt){
        // translate to normal
        this.changeIndex(this.state.current);

        if(!this.ob){
            return;
        }

        this.ob.style.webkitTransition = '300ms ease';

        const { maxScale } = this.props,
            isLongPic = this.ob.getAttribute('long');
        // scale to normal
        if (this.ob.scaleX < 1) {
            this.restore(false);
        }
        if (this.ob.scaleX > maxScale && !isLongPic){
            this.setScale(maxScale);
        }

        // rotate to normal
        let rotation = this.ob.rotateZ % 360,
            rate = this.ob.getAttribute('rate');

        if(rotation < 0){
            rotation = 360 + rotation;
        }
        this.ob.rotateZ = rotation;

        if (rotation > 0 && rotation < 45) {
            this.ob.rotateZ = 0;
        } else if (rotation >= 315) {
            this.ob.rotateZ = 360;
        } else if (rotation >= 45 && rotation < 135) {
            this.ob.rotateZ = 90;
            this.setScale(rate);
        } else if (rotation >= 135 && rotation < 225) {
            this.ob.rotateZ = 180;
        } else if (rotation >= 225 && rotation < 315) {
            this.ob.rotateZ = 270;
            this.setScale(rate);
        }
    }

    onDoubleTap(evt){
        if( this.props.disableDoubleTap ){
            return false;
        }

        const { origin } = evt,
            originX = origin[0] - this.screenWidth/2 - document.body.scrollLeft,
            originY = origin[1] - this.screenHeight/2 - document.body.scrollTop,
            isLongPic = this.ob.getAttribute('long');

        if(this.ob.scaleX === 1){
            !isLongPic && (this.ob.translateX = this.ob.originX = originX);
            !isLongPic && (this.ob.translateY = this.ob.originY = originY);
            this.setScale(isLongPic ? this.screenWidth / this.ob.width : this.props.maxScale);
        }else{
            this.ob.translateX = this.ob.originX;
            this.ob.translateY = this.ob.originY;
            this.setScale(1);
        }   
    
        // console.log('origin',this.ob.originX, this.ob.originY);
    }

    bindStyle(current) {
        this.setState({ current }, () => {
            this.ob && this.restore();
            this.ob = document.getElementById(`view${current}`);
            if(this.ob && !this.ob.scaleX){ 
                Transform(this.ob)
            }

            const page = this.page;
            if(page){
                page.classList.remove('hide');
            }
        })
    }

    changeIndex(current, ease=true) {
        ease && (this.list.style.webkitTransition = '300ms ease');
        this.list.translateX = -current*(this.screenWidth + this.props.gap);

        this.props.changeIndex && this.props.changeIndex(current);
    }

    setScale(size) {
        this.ob.style.webkitTransition = '300ms ease-in-out';
        this.ob.scaleX = this.ob.scaleY = size;
    }

    restore(rotate=true) {
        this.ob.translateX = this.ob.translateY = 0;
        !!rotate && (this.ob.rotateZ = 0);
        this.ob.scaleX = this.ob.scaleY = 1;
        this.ob.originX = this.ob.originY = 0;
    }

    endAnimation() {
        this.list.style.webkitTransition = '0';
        this.ob && this.ob.style && (this.ob.style.webkitTransition = '0');
    }

    checkBoundary(deltaX = 0, deltaY = 0) {
        // console.log(this.ob.width, this.ob.height);
        const { scaleX, translateX, translateY, originX, originY, width, height } = this.ob,
            rate = this.ob.getAttribute('rate');

        if(scaleX !== 1 || scaleX !== rate){
            // include long picture
            const rangeLeft = (scaleX - 1) * (width / 2 + originX) + originX,
                rangeRight = -(scaleX - 1) * (width / 2 - originX) + originX,
                rangeUp = (scaleX - 1) * (height / 2 + originY) + originY,
                rangeDown = -(scaleX - 1) * (height / 2 - originY) + originY;

            // console.log(rangeLeft, rangeRight, rangeUp, rangeDown);

            if(translateX + deltaX <= rangeLeft
                && translateX + deltaX >= rangeRight
                && translateY + deltaY <= rangeUp
                && translateY + deltaY >= rangeDown ) {
                return true;
            }
        }
        return false;
    }
}

export const SingleImgView = new Singleton(ImageView)

export default ImageView
