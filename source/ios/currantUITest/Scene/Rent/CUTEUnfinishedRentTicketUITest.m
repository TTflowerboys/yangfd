//
//  CUTEUnfinishedTicketUITest.m
//  currant
//
//  Created by Foster Yin on 7/14/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "KIFUITestActor+Login.h"
#import "CUTEUnfinishedRentTicketListForm.h"

SpecBegin(UnfinishedRentTicketUI)

describe(@"FormReload", ^ {

    before(^{
        [tester logout];
        [tester login];
    });

    it(@"should sucess", ^ {
        CUTEUnfinishedRentTicketListForm *form = [CUTEUnfinishedRentTicketListForm new];
        assertThat(form.unfinishedRentTickets, nilValue());

        [[form reload] continueWithBlock:^id(BFTask *task) {
            assertThat(task.result, notNilValue());
            assertThatInt([task.result count], isNot(0));
            assertThat(form.unfinishedRentTickets, notNilValue());
            assertThatInt([form.unfinishedRentTickets count], isNot(0));
            return task;
        }];
    });

    [tester waitForTimeInterval:5];
    
});

describe(@"TableViewReload", ^{
    beforeAll(^{
        [tester logout];
        [tester login];
    });

    it(@"should swipe success", ^{
        [tester swipeViewWithAccessibilityLabel:STR(@"出租房草稿列表") inDirection:KIFSwipeDirectionDown];
        [tester waitForAnimationsToFinish];
        [tester swipeViewWithAccessibilityLabel:STR(@"出租房草稿列表") inDirection:KIFSwipeDirectionUp];
        [tester waitForAnimationsToFinishWithTimeout:1];

    });

    it(@"should tap cell success", ^{
        [tester swipeViewWithAccessibilityLabel:STR(@"出租房草稿列表") inDirection:KIFSwipeDirectionDown];
        [tester waitForAnimationsToFinish];
        [tester tapRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0] inTableViewWithAccessibilityIdentifier:STR(@"出租房草稿列表")];
        [tester waitForViewWithAccessibilityLabel:STR(@"房产信息")];
    });
});

describe(@"PublishedRentTicket", ^{
    beforeAll(^{
        [tester logout];
        [tester login];
    });

    it(@"should tap success", ^{
        [tester tapViewWithAccessibilityLabel:STR(@"已发布")];
        [tester waitForTimeInterval:5];
        [tester waitForViewWithAccessibilityLabel:STR(@"我的房产")];

    });


});

SpecEnd
