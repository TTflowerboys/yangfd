//
//  CUTETooltipVIew.m
//  currant
//
//  Created by Foster Yin on 6/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETooltipVIew.h"
#import "CUTECommonMacro.h"
#import <UILabel+JDFTooltips.h>
#import <UIView+JDFTooltips.h>
#import "UIView+Border.h"
#import <ALActionBlocks.h>

#define CLOSE_ICON_WITDH 34

#define CLOSE_ICON_VERTICAL_MARGIN 20


@interface JDFTooltipView (Subclass)

@property (nonatomic, readonly) UILabel *tooltipTextLabel;

@property (nonatomic) CGPoint arrowPoint;
@property (nonatomic) CGFloat width; // change to width?

@property (nonatomic, weak) UIView *tooltipSuperview;

@property (nonatomic, weak) UIView *targetView;

@property (nonatomic, copy) void (^showCompletionBlock)();

@property (nonatomic, copy) void (^hideCompletionBlock)();

- (void)commonInit;

- (void)showAtPoint:(CGPoint)point inView:(UIView *)view width:(CGFloat)width arrowDirection:(JDFTooltipViewArrowDirection)arrowDirection;

- (CGRect)tooltipFrameForArrowPoint:(CGPoint)point width:(CGFloat)width labelFrame:(CGRect)labelFrame arrowDirection:(JDFTooltipViewArrowDirection)arrowDirection hostViewSize:(CGSize)hostViewSize;

- (CGFloat)overflowAdjustmentForFrame:(CGRect)frame withHostViewSize:(CGSize)hostViewSize;

- (CGPoint)pointForTargetView:(UIView *)targetView arrowDirection:(JDFTooltipViewArrowDirection)arrowDirection;

- (CGFloat)arrowHeight;

- (CGFloat)arrowWidth;

- (CGFloat)arrowAngle;

- (CGFloat)minimumArrowPadding;

- (CGFloat)labelPadding;

- (CGFloat)minimumPaddingToSuperview;

- (void)sanitiseArrowPointWithWidth:(CGFloat)width;

@end

@interface CUTETooltipView ()

@property (nonatomic, retain) UIImageView *closeIcon;

@property (nonatomic, retain) UIGestureRecognizer *dismissGetureRecognizer;

@end


@implementation CUTETooltipView

- (void)commonInit {
    [super commonInit];
    UIImageView *closeIcon = [[UIImageView alloc] initWithImage:IMAGE(@"tooltip-close")];
    closeIcon.contentMode = UIViewContentModeCenter;
    [self addSubview:closeIcon];
    self.closeIcon = closeIcon;
    self.tooltipBackgroundColour = HEXCOLOR(0x333333, 1.0);
    self.textColour = [UIColor whiteColor];
    self.shadowEnabled = NO;
}

- (void)setViewForTouchToDismiss:(UIView *)viewForTouchToDismiss {
    _viewForTouchToDismiss = viewForTouchToDismiss;

    __weak typeof(self)weakSelf = self;
    UITapGestureRecognizer *gesture = [[UITapGestureRecognizer alloc] initWithBlock:^(UIGestureRecognizer* weakSender) {
        [weakSelf hideAnimated:YES];
    }];
    [_viewForTouchToDismiss addGestureRecognizer:gesture];
    self.dismissGetureRecognizer = gesture;
}

- (void)setViewForPanToDismiss:(UIView *)viewForPanToDismiss {
    _viewForPanToDismiss = viewForPanToDismiss;

    __weak typeof(self)weakSelf = self;
    UIPanGestureRecognizer *panGesture = [[UIPanGestureRecognizer alloc] initWithBlock:^(UIGestureRecognizer* weakSender) {
        [weakSelf hideAnimated:YES];
    }];
    [_viewForPanToDismiss addGestureRecognizer:panGesture];
    self.dismissGetureRecognizer = panGesture;
}


- (CGFloat)labelPadding {
    return 30;
}

- (CGFloat)horizontalLabelPadding {
    return 20;
}

- (CGFloat)arrowHeight {
    return 14;
}

- (CGFloat)arrowWidth {
    return 14;
}

- (void)updateLabelcenterHorizontallyInSuperview:(UILabel *)label
{
    CGFloat viewWidth = label.frame.size.width;
    CGFloat superviewWidth = label.superview.frame.size.width;

    CGRect frame = label.frame;
    frame.origin.x = (superviewWidth - viewWidth - CLOSE_ICON_WITDH) / 2;
    label.frame = frame;
}

- (void)showAtPoint:(CGPoint)point inView:(UIView *)view width:(CGFloat)width arrowDirection:(JDFTooltipViewArrowDirection)arrowDirection
{
    self.arrowDirection = arrowDirection;
    self.arrowPoint = point;
    self.alpha = 1.0f;

    // Add ourselves to the view
    [view addSubview:self];

    CGRect labelFrame = self.frame;
    labelFrame.size.width = width - [self arrowHeight] - [self horizontalLabelPadding]; // arrowHeight and labelPadding should be doubled before subtracting?
    labelFrame.origin.y = [self arrowHeight] + [self labelPadding];
    labelFrame.origin.x = labelFrame.origin.x - CLOSE_ICON_WITDH;
    self.tooltipTextLabel.frame = labelFrame;
    [self.tooltipTextLabel jdftt_resizeHeightToFitTextContents];


    CGRect tooltipFrame = [self tooltipFrameForArrowPoint:point width:(self.tooltipTextLabel.frame.size.width + [self arrowHeight] + [self labelPadding] + CLOSE_ICON_WITDH) labelFrame:labelFrame arrowDirection:self.arrowDirection hostViewSize:self.superview.frame.size];
    self.frame = tooltipFrame;

    self.closeIcon.frame = CGRectMake(RectWidthExclude(self.bounds, (CLOSE_ICON_WITDH + 14)), CLOSE_ICON_VERTICAL_MARGIN, CLOSE_ICON_WITDH, RectHeight(self.bounds) - CLOSE_ICON_VERTICAL_MARGIN * 2);
    [self.closeIcon addLeftBorderWithColor:HEXCOLOR(0x4d4d4d, 1) andWidth:1];

    [self updateLabelcenterHorizontallyInSuperview:self.tooltipTextLabel];
    [self.tooltipTextLabel jdftt_centerVerticallyInSuperview];

    [self sanitiseArrowPointWithWidth:width];

    // Setup the staring point of animation (frame inset, text invisible)
    self.frame = CGRectInset(self.frame, 10, 10);
    self.tooltipTextLabel.alpha = 0.0f;

    // Perform the animation
    [UIView animateWithDuration:0.3 delay:0.0 usingSpringWithDamping:0.4 initialSpringVelocity:0.0 options:UIViewAnimationOptionCurveEaseInOut animations:^{
        self.frame = tooltipFrame;
        [UIView animateWithDuration:0.1 delay:0.15 options:UIViewAnimationOptionCurveLinear animations:^{
            self.tooltipTextLabel.alpha = 1.0f;
        } completion:nil];
    } completion:^(BOOL finished) {
        if (self.showCompletionBlock) {
            self.showCompletionBlock();
        }
    }];
}

- (void)hideAnimated:(BOOL)animated
{
    self.closeIcon.hidden = YES;
    [self.dismissGetureRecognizer.view removeGestureRecognizer:self.dismissGetureRecognizer];
    self.dismissGetureRecognizer = nil;
    
    [super hideAnimated:animated];
}


- (void)setTooltipNeedsLayoutWithHostViewSize:(CGSize)hostViewSize
{
    // We can only try to layout ourselves out if we have a targetView.
    if (self.targetView) {
        self.arrowPoint = [self pointForTargetView:self.targetView arrowDirection:self.arrowDirection];
        CGRect newFrame = [self tooltipFrameForArrowPoint:self.arrowPoint width:self.width labelFrame:self.tooltipTextLabel.frame arrowDirection:self.arrowDirection hostViewSize:hostViewSize];
        self.frame = newFrame;
         self.closeIcon.frame = CGRectMake(RectWidthExclude(self.bounds, (CLOSE_ICON_WITDH + 10)), 0, CLOSE_ICON_WITDH, RectHeight(self.bounds));
        [self setNeedsDisplay];
    }
}

- (void)drawCanvas1WithFrame:(CGRect)frame;
{
    UIColor *backgroundColour = self.tooltipBackgroundColour;

    //// General Declarations
    CGContextRef context = UIGraphicsGetCurrentContext();


    //// Variable Declarations
    CGPoint point = [self convertPoint:self.arrowPoint fromView:self.superview];
    CGFloat angle = [self arrowAngle];
    CGFloat arrowHeight = [self arrowHeight];

    //// Group
    {
        //// Rectangle Drawing
        CGRect rect = CGRectMake(CGRectGetMinX(frame) + 14, CGRectGetMinY(frame) + 12, CGRectGetWidth(frame) - 28, CGRectGetHeight(frame) - 24);
        UIBezierPath* rectanglePath = [UIBezierPath bezierPathWithRoundedRect:rect  cornerRadius: 0];
        [backgroundColour setFill];
        [rectanglePath fill];


        //// Bezier Drawing
        CGContextSaveGState(context);
        CGContextTranslateCTM(context, (point.x), (point.y));
        CGContextRotateCTM(context, -angle * M_PI / 180);

        UIBezierPath* bezierPath = UIBezierPath.bezierPath;
        [bezierPath moveToPoint: CGPointMake(-0, 0.02)];
        [bezierPath addCurveToPoint: CGPointMake(-7, arrowHeight) controlPoint1: CGPointMake(-2, 0.02) controlPoint2: CGPointMake(-7, arrowHeight)];
        [bezierPath addLineToPoint: CGPointMake(7, arrowHeight)];
        [bezierPath addCurveToPoint: CGPointMake(-0, 0.02) controlPoint1: CGPointMake(7, arrowHeight) controlPoint2: CGPointMake(2, 0.02)];
        [bezierPath closePath];
        [backgroundColour setFill];
        [bezierPath fill];

        CGContextRestoreGState(context);
    }
}


@end
