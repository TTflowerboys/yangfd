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

    it(@"should edit address success when create", ^ {
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
        [tester clearTextFromAndThenEnterText:@"430079" intoViewWithAccessibilityLabel:@"Postcode"];
        [tester waitForAbsenceOfViewWithAccessibilityLabel:STR(@"搜索中...")];
        //request
        [tester waitForTimeInterval:10];
        [tester tapViewWithAccessibilityLabel:STR(@"OK")];
    });

    it(@"should edit address success when re-edit", ^ {
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
        indexPath = [NSIndexPath indexPathForRow:0 inSection:1];
        cell = [tableView cellForRowAtIndexPath:indexPath];
        assertThat(cell.detailTextLabel.text, notNilValue());//country
        indexPath = [NSIndexPath indexPathForRow:1 inSection:1];
        cell = [tableView cellForRowAtIndexPath:indexPath];
        assertThat(cell.detailTextLabel.text, notNilValue());//city
        [tester clearTextFromAndThenEnterText:@"430079" intoViewWithAccessibilityLabel:@"Postcode"];
        [tester waitForViewWithAccessibilityLabel:STR(@"是否按新postcode重新定位再继续？")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"好的")];
        //request
        [tester waitForTimeInterval:10];
        [tester tapViewWithAccessibilityLabel:STR(@"OK")];

    });


});

SpecEnd
