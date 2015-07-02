//
//  CUTEAddressEditUITest.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "KIFUITestActor+Login.h"
#import "KIFUITestActor+RentType.h"
#import "CUTECommonMacro.h"


SpecBegin(AddressEditUI)

describe(@"AddressEdit", ^ {

    beforeAll(^{
        [tester login];
        [tester waitForTimeInterval:5];//ticket or rent-type load
        [tester selectRentTypeWhole];
    });

    it(@"should edit address success", ^ {
        [tester waitForTimeInterval:2];
        //location permission
        if ([tester tryFindingViewWithAccessibilityLabel:STR(@"允许") error:nil]) {
            [tester tapViewWithAccessibilityLabel:STR(@"允许")];
        }

        [tester waitForAnimationsToFinish];
        [tester waitForAbsenceOfViewWithAccessibilityLabel:@"MapTextFieldIndicator"];
        [tester waitForAnimationsToFinish];
        UITextField *textField = nil;
        [tester tryFindingAccessibilityElement:nil view:&textField withIdentifier:@"MapTextField" tappable:NO error:nil];
        assertThat(textField, notNilValue());
        [tester tapScreenAtPoint:CGPointMake(50, textField.frame.origin.y)];

        [tester waitForAnimationsToFinish];
        [tester tryFindingAccessibilityElement:nil view:&textField withIdentifier:@"Postcode" tappable:NO error:nil];
        [textField becomeFirstResponder];
        [tester enterText:@"430079" intoViewWithAccessibilityLabel:@"Postcode"];
        [tester waitForAbsenceOfViewWithAccessibilityLabel:STR(@"搜索中...")];
    });
    
});

SpecEnd
