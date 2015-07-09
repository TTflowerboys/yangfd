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
#import "UIAutomationHelper.h"

@implementation KIFUITestActor (AddressMap)

- (void)allowLocationAccess {
    //TODO now don't work
    //location permission
    if ([self tryFindingViewWithAccessibilityLabel:@"允许" error:nil]) {
        [self tapViewWithAccessibilityLabel:@"允许"];
    }

    if ([self tryFindingViewWithAccessibilityLabel:@"Allow" error:nil]) {
        [self tapViewWithAccessibilityLabel:@"Allow"];
    }

}

- (void)setPropertyLocationWithCurrentLocation {
    [self waitForTimeInterval:5];
    [self allowLocationAccess];

    [self waitForAnimationsToFinish];
    [self waitForAbsenceOfViewWithAccessibilityLabel:@"MapTextFieldIndicator"];
    [self waitForAnimationsToFinish];
}

@end
