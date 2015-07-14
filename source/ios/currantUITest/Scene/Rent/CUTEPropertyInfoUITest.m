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
        [tester logout];
        [tester login];
        [tester waitForTimeInterval:5];//ticket or rent-type load
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

describe(@"PropertyInfoEdit", ^{

    beforeAll(^{
        [tester logout];
        [tester login];
        [tester waitForTimeInterval:5];//ticket or rent-type load
        [tester tapRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0] inTableViewWithAccessibilityIdentifier:STR(@"出租房草稿列表")];
    });

    it(@"should edit rent price success", ^{
        [tester waitForViewWithAccessibilityLabel:STR(@"房产信息")];
         [tester tapRowAtIndexPath:[NSIndexPath indexPathForRow:1 inSection:1] inTableViewWithAccessibilityIdentifier:STR(@"房产信息表单")];
        [tester waitForAnimationsToFinish];
        [tester waitForViewWithAccessibilityLabel:STR(@"租金")];
        UITableView *tableView = (UITableView *)[tester waitForViewWithAccessibilityLabel:STR(@"租金表单")];
        UIAccessibilityElement *element = [[UIAccessibilityElement alloc] initWithAccessibilityContainer:tableView];
        element.accessibilityIdentifier = STR(@"租金");
        [tester clearTextFromElement:element inView:tableView];
        [tester enterTextIntoCurrentFirstResponder:@"178"];
        [tester tapViewWithAccessibilityLabel:STR(@"确定")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"房产信息")];
        [tester waitForAnimationsToFinish];
        tableView = (UITableView *)[tester waitForViewWithAccessibilityLabel:STR(@"房产信息表单")];
        UITableViewCell *rentPriceCell = [tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:1 inSection:1]];
        assertThat(rentPriceCell.detailTextLabel.text, equalTo(@"£178.00/周"));
    });
});

SpecEnd

