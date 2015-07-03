//
//  CUTEPropertyInfoUITest.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "KIFUITestActor+Login.h"
#import "KIFUITestActor+RentType.h"
#import "KIFUITestActor+AddressMap.h"
#import "KIFUITestActor+PropertyInfo.h"


SpecBegin(PropertyInfoUI)

describe(@"PropertyInfo", ^ {

    beforeAll(^{
        [tester login];
        [tester selectRentTypeWhole];
        [tester setPropertyLocationWithCurrentLocation];
        [tester tapViewWithAccessibilityLabel:STR(@"继续")];
    });

    it(@"should show correct area name", ^ {
        [tester waitForViewWithAccessibilityLabel:STR(@"房产信息表单")];
        UITableView *tableView = nil;
        [tester tryFindingAccessibilityElement:nil view:&tableView withIdentifier:STR(@"房产信息表单") tappable:YES error:nil];
        assertThat(tableView, notNilValue());
        NSIndexPath *indexPath = [NSIndexPath indexPathForRow:6 inSection:1];
        [tester swipeRowAtIndexPath:indexPath inTableView:tableView inDirection:KIFSwipeDirectionUp];
        UITableViewCell *areaCell = [tableView cellForRowAtIndexPath:indexPath];
        assertThat(areaCell.textLabel.text, equalTo(@"房屋面积（选填）"));
    });

    it(@"should increment bedroom count success", ^{
        [tester setBedroomCount];
    });
});

SpecEnd
