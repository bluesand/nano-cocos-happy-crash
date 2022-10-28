**升级引擎版本问题：**



引擎相关（加粗为引擎相关内容，-越多 耗费时间越多）

1- 3 7-- 8---- 11 13 14- 15--



1.脚本：

Js-》ts的代码变化  引擎无法全自动 大部分是代码需手动修改

**代码的注释基本都被删除干净**

**代码除了方法名其他都自动注释（还不如不注释 还得自己一个一个复原）**



2.I18n

2d与3d的i18n不同，需要重新绑定



3.摄像机

**自动生成的2d摄像机存在问题——————camera->projection->ortho**



4.节点渲染分组

2d迁移过来的节点都默认为default 如果修改了摄像机的渲染勾选或需要用到渲染分组的也需要修改



5.动作修改

action废弃 修改为tween



6.接口修改   具体看官方文档

例如

2d:rotation  	个位数	3d:eulerAngle Vec3  

   Scale 个位数 		   scale Vec3

   cc.Winsize 	    view.getCanvasSize()

图片置灰:sprite.grayscale = true

动作衔接 tween.then(tween().to()…)



7.引擎自动转换的

**@property只有定义，在编辑器面板无法赋值，必须手动添加相应type**

@property

  public arrRewardNode: Array<Node> = [];

———>>>

@property(Node)

  public arrRewardNode: Array<Node> = [];



8.动画

**容易因为引擎升级之后 参数不一样导致不能播放并且报错————只能通过实际运行去看到底有哪些动画**

**帧动画的所有 spriteFrame的关键帧 基本都图片资源丢失————只能通过一帧一帧重新绑定**

**所有动画相关参数都有可能失效：目前我遇到的是scale无效，特效还遇到更多————目前手动修改所有数值**



9.原本坐标为vec2 的，要以防坐标在运行时 z轴为undefined



10.坐标的加减记得加上.clone()



11.**Layout的 resize Mode -> ResizeMode 没有很好的继承之前的参数 会被重置**



12.3d:eulangles 方向与 2d rotate 正负方向相反



13.**一个节点有动画组件 有概率他的父节点也会存在这个动画，删除后，下次打开还可能重新复原回来** 

**例：assets/resources/prefab/ui/signIn/signInReward.prefab**

**signInReward signInReward节点 和原本的动画节点getItem**



14.**使用了艺术数字的节点 有概率报错。重新生成一个新的再赋值就可以使用。但是在下一台电脑再打开会出现同样的问题，需要再重复一遍一样的操作。**

**例：艺术数字：assets/fonts/pveNumber.labelatlas  艺术数字的图片 assets/fonts/pveImgNumber.png**

**复现操作：用3.0.0打开2.x的link项目，运行报错**



15.**粒子的各种参数修改————以前在2d是这样的效果 到了3d因为各种参数修改导致效果不一样**





**出问题的动画列举：**

**序列帧动画 spriteFrame全部丢失**

**透明度：**

**1.assets/resources/gamePackages/effects/fight/guide/guide.prefab**

​	**guide的guideHand01 帧数：35帧-45帧的透明度0-255**

**大小：**

**1.assets/resources/gamePackages/effects/fight/linkLine/linkLine.prefab**

​	**linkLine的homeLightBar01 正确数据为 0,1,1->1,1,1**

**2.assets/resources/gamePackages/effects/fight/linkStar/linkStar.prefab**

​	**linkStar的homeStar05 正确数据为 1.2,1.2,1.2->0,0,0**

**粒子：**

**1.assets/resources/gamePackages/effects/fight/guide/guide.prefab**

​	**guide的particleUp/particleDown 粒子的方向不跟着父节点旋转（2d会）**
