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

#define CLOSE_ICON_WITDH 34

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

@interface CUTETooltipVIew ()

@property (nonatomic, retain) UIImageView *closeIcon;

@end


@implementation CUTETooltipVIew

- (void)commonInit {
    [super commonInit];
    UIImageView *closeIcon = [[UIImageView alloc] initWithImage:IMAGE(@"tooltip-close")];
    closeIcon.contentMode = UIViewContentModeCenter;
    [self addSubview:closeIcon];
    self.closeIcon = closeIcon;
    self.tooltipBackgroundColour = HEXCOLOR(0x33333, 1.0);
    self.textColour = [UIColor whiteColor];
}


- (CGFloat)labelPadding {
    return 40;
}

- (CGFloat)horizontalLabelPadding {
    return 20;
}

- (CGRect)tooltipFrameForArrowPoint:(CGPoint)point width:(CGFloat)width labelFrame:(CGRect)labelFrame arrowDirection:(JDFTooltipViewArrowDirection)arrowDirection hostViewSize:(CGSize)hostViewSize
{
    CGRect tooltipFrame = CGRectZero;
    tooltipFrame.origin = point;
    tooltipFrame.size.width = width + CLOSE_ICON_WITDH;
    tooltipFrame.origin.x = tooltipFrame.origin.x - [self overflowAdjustmentForFrame:tooltipFrame withHostViewSize:hostViewSize];
    tooltipFrame.size.height = self.tooltipTextLabel.frame.size.height + [self labelPadding] + [self arrowHeight];

    if (arrowDirection == JDFTooltipViewArrowDirectionUp) {

    } else if (arrowDirection == JDFTooltipViewArrowDirectionRight) {
        tooltipFrame.origin.x = point.x - tooltipFrame.size.width - ([self arrowHeight] * 1.5);
        tooltipFrame.origin.y = point.y - [self arrowWidth] - [self minimumArrowPadding];
    } else if (arrowDirection == JDFTooltipViewArrowDirectionDown) {
        tooltipFrame.origin.y = point.y - tooltipFrame.size.height;
    } else if (arrowDirection == JDFTooltipViewArrowDirectionLeft) {
        tooltipFrame.origin.x = point.x;
        tooltipFrame.origin.y = point.y - [self arrowWidth] - [self minimumArrowPadding];
    }

    if (arrowDirection == JDFTooltipViewArrowDirectionUp || arrowDirection == JDFTooltipViewArrowDirectionDown) {
        CGFloat minOffset = [self arrowHeight] + [self minimumArrowPadding];
        CGFloat offset = point.x - tooltipFrame.origin.x;
        if (offset < minOffset) {
            tooltipFrame.origin.x = point.x - minOffset;
        }
    }

    return tooltipFrame;
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
    self.tooltipTextLabel.frame = labelFrame;
    [self.tooltipTextLabel jdftt_resizeHeightToFitTextContents];


    CGRect tooltipFrame = [self tooltipFrameForArrowPoint:point width:(self.tooltipTextLabel.frame.size.width + [self arrowHeight] + [self labelPadding]) labelFrame:labelFrame arrowDirection:self.arrowDirection hostViewSize:self.superview.frame.size];
    self.frame = tooltipFrame;

    self.closeIcon.frame = CGRectMake(RectWidthExclude(self.bounds, (CLOSE_ICON_WITDH + 8)), 0, CLOSE_ICON_WITDH, RectHeight(self.bounds));

    [self.tooltipTextLabel jdftt_centerHorizontallyInSuperview];
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
