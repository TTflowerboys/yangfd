//
//  KIFUITestActor+RentType.m
//  currant
//
//  Created by Foster Yin on 7/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "KIFUITestActor+RentType.h"
#import "CUTECommonMacro.h"
#import "CGGeometry-KIFAdditions.h"
#import "KIFUITestActor-ConditionalTests.h"

@implementation KIFUITestActor (RentType)

- (void)selectRentTypeWhole {
    if ([tester tryFindingViewWithAccessibilityLabel:STR(@"创建") error:nil]) {
        [tester tapViewWithAccessibilityLabel:STR(@"创建")];
    }
    [tester waitForViewWithAccessibilityLabel:STR(@"出租类型列表")];

    UITableView *tableView = nil;
    [tester tryFindingAccessibilityElement:nil view:&tableView withIdentifier:STR(@"出租类型列表") tappable:NO error:nil];
    assertThat(tableView, notNilValue());
    assertThatInt([tableView numberOfRowsInSection:0], equalToInt(2));
    UITableViewCell *wholeHouseCell = [tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]];
    assertThat(wholeHouseCell.textLabel.text, equalTo(@"整套"));
    UITableViewCell *singleRoomCell = [tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:1 inSection:0]];
    assertThat(singleRoomCell.textLabel.text, equalTo(@"单间"));

    [tester tapRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0] inTableViewWithAccessibilityIdentifier:STR(@"出租类型列表")];
}

- (void)selectRentTypeSingle {
    if ([tester tryFindingViewWithAccessibilityLabel:STR(@"创建") error:nil]) {
        [tester tapViewWithAccessibilityLabel:STR(@"创建")];
    }
    [tester waitForViewWithAccessibilityLabel:STR(@"出租类型列表")];

    UITableView *tableView = nil;
    [tester tryFindingAccessibilityElement:nil view:&tableView withIdentifier:STR(@"出租类型列表") tappable:NO error:nil];
    assertThat(tableView, notNilValue());
    assertThatInt([tableView numberOfRowsInSection:0], equalToInt(2));
    UITableViewCell *wholeHouseCell = [tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]];
    assertThat(wholeHouseCell.textLabel.text, equalTo(@"整套"));
    UITableViewCell *singleRoomCell = [tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:1 inSection:0]];
    assertThat(singleRoomCell.textLabel.text, equalTo(@"单间"));

    [tester tapRowAtIndexPath:[NSIndexPath indexPathForRow:1 inSection:0] inTableViewWithAccessibilityIdentifier:STR(@"出租类型列表")];
}

@end
