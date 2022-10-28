import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('StopPropagation')
export class StopPropagation extends Component {

    onLoad () {
    }

    onEnable () {
        this.node.on('touchstart', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('touchend', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('touchmove', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('touchcancel', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('mousedown', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('mouseenter', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('mousemove', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('mouseleave', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('mouseup', function (event: any) {
           event.stopPropagation();
        });
        this.node.on('mousewheel', function (event: any) {
           event.stopPropagation();
        });
    }

    onDisable () {
        this.node.off('touchstart', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('touchend', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('touchmove', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('touchcancel', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('mousedown', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('mouseenter', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('mousemove', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('mouseleave', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('mouseup', function (event: any) {
           event.stopPropagation();
        });
        this.node.off('mousewheel', function (event: any) {
           event.stopPropagation();
        });
    }

}