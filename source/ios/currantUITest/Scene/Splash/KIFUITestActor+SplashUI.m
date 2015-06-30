//
//  KIFUITestActor+SplashUI.m
//  currant
//
//  Created by Foster Yin on 6/30/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "KIFUITestActor+SplashUI.h"
#import "CUTECommonMacro.h"

@implementation KIFUITestActor (SplashUI)

- (void)swipeToSplashEnd {
    [tester swipeViewWithAccessibilityLabel:STR(@"引导页面") inDirection:KIFSwipeDirectionLeft];
    [tester waitForAnimationsToFinish];
    [tester swipeViewWithAccessibilityLabel:STR(@"引导页面") inDirection:KIFSwipeDirectionLeft];
    [tester waitForAnimationsToFinish];
}

@end
