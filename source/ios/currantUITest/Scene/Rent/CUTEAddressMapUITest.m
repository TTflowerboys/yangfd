//
//  CUTEAddressMapUITest.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "KIFUITestActor+RentType.h"
#import "KIFUITestActor+Login.h"
#import "KIFUITestActor+AddressMap.h"


SpecBegin(AddressMapUI)

describe(@"AddressMap", ^ {

    beforeAll(^{
        [tester logout];
        [tester login];
        [tester waitForTimeInterval:10];
        [tester selectRentTypeWhole];
    });

    it(@"should get current location ok", ^ {
        [tester setPropertyLocationWithCurrentLocation];
    });

    it(@"should edit location success when create", ^ {
        [tester setPropertyLocationWithCurrentLocation];

        //then move map
        [tester swipeViewWithAccessibilityLabel:STR(@"地图") inDirection:KIFSwipeDirectionRight];
        [tester waitForAnimationsToFinish];
        [tester waitForAbsenceOfViewWithAccessibilityLabel:@"MapTextFieldIndicator"];
        [tester waitForTimeInterval:3];
    });

    it(@"should edit location success when re-edit", ^ {
        [tester waitForTimeInterval:2];
        //location permission
        if ([tester tryFindingViewWithAccessibilityLabel:STR(@"允许") error:nil]) {
            [tester tapViewWithAccessibilityLabel:STR(@"允许")];
        }

        [tester waitForAnimationsToFinish];
        [tester waitForAbsenceOfViewWithAccessibilityLabel:@"MapTextFieldIndicator"];
        [tester waitForAnimationsToFinish];
        [tester waitForTimeInterval:3];
        [tester tapViewWithAccessibilityLabel:STR(@"继续")];
        [tester waitForTimeInterval:5];
        [tester waitForViewWithAccessibilityLabel:STR(@"房产信息表单")];
        UITableView *tableView = nil;
        [tester tryFindingAccessibilityElement:nil view:&tableView withIdentifier:STR(@"房产信息表单") tappable:YES error:nil];
        assertThat(tableView, notNilValue());
        NSIndexPath *indexPath = [NSIndexPath indexPathForRow:5 inSection:1];
        [tester swipeRowAtIndexPath:indexPath inTableView:tableView inDirection:KIFSwipeDirectionUp];
        UITableViewCell *cell = [tableView cellForRowAtIndexPath:indexPath];
        [tester tapRowAtIndexPath:indexPath inTableViewWithAccessibilityIdentifier:STR(@"房产信息表单")];
        [tester waitForAnimationsToFinish];
        [tester tryFindingAccessibilityElement:nil view:&tableView withIdentifier:STR(@"地址编辑表单") tappable:YES error:nil];
        indexPath = [NSIndexPath indexPathForRow:0 inSection:0];
        [tester tapRowAtIndexPath:indexPath inTableViewWithAccessibilityIdentifier:STR(@"地址编辑表单")];
        [tester waitForAnimationsToFinish];
        [tester setPropertyLocationWithCurrentLocation];
        //then move map
        [tester swipeViewWithAccessibilityLabel:STR(@"地图") inDirection:KIFSwipeDirectionRight];
        [tester waitForAnimationsToFinish];
        [tester waitForAbsenceOfViewWithAccessibilityLabel:@"MapTextFieldIndicator"];
        [tester waitForTimeInterval:3];

        [tester tapViewWithAccessibilityLabel:STR(@"返回")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"返回")];
    });
});

SpecEnd
