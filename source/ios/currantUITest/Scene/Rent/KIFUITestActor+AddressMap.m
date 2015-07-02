//
//  KIFUITestActor+AddressMap.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "KIFUITestActor+AddressMap.h"
#import "KIFUITestActor-ConditionalTests.h"
#import "CUTECommonMacro.h"

@implementation KIFUITestActor (AddressMap)

- (void)setPropertyLocationWithCurrentLocation {
    [self waitForTimeInterval:2];
    //location permission
    if ([self tryFindingViewWithAccessibilityLabel:STR(@"允许") error:nil]) {
        [self tapViewWithAccessibilityLabel:STR(@"允许")];
    }

    [self waitForAnimationsToFinish];
    [self waitForAbsenceOfViewWithAccessibilityLabel:@"MapTextFieldIndicator"];
    [self waitForAnimationsToFinish];
}

@end
