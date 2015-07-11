//
//  CUTEPublishRentTicketStoryTest.m
//  currant
//
//  Created by Foster Yin on 7/3/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import <KIF.h>
#import "CUTECommonMacro.h"
#import "KIFUITestActor+Login.h"
#import "KIFUITestActor+RentType.h"
#import "KIFUITestActor+SplashUI.h"
#import "KIFUITestActor+AddressMap.h"
#import "KIFUITestActor+PropertyInfo.h"


SpecBegin(PublishRentTiecktUS)

describe(@"PublishRentTicket", ^ {

    before(^{
        [tester logout];
        [tester login];
        //wait for the unfinished ticket load
        [tester waitForTimeInterval:10];
        [tester selectRentTypeWhole];
        [tester waitForViewWithAccessibilityLabel:STR(@"房产位置")];
        [tester setPropertyLocationWithCurrentLocation];
        [tester waitForTimeInterval:3];
        [tester tapViewWithAccessibilityLabel:STR(@"继续")];
        [tester setBedroomCount];

    });

    it(@"should publish success", ^ {
        [tester tapViewWithAccessibilityLabel:STR(@"预览")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"继续")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"发布")];
        [tester waitForTimeInterval:5];
        [tester waitForViewWithAccessibilityLabel:STR(@"发布成功")];
        [tester waitForAnimationsToFinish];
        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
        [tester waitForAnimationsToFinish];

        [system waitForApplicationToOpenAnyURLWhileExecutingBlock:^{
            [tester tapViewWithAccessibilityLabel:STR(@"微信好友")];
        } returning:YES];
        [tester waitForTimeInterval:3];
        [tester tapViewWithAccessibilityLabel:STR(@"完成")];
    });

    it(@"should publish success with photoes", ^ {
        [tester tapViewWithAccessibilityLabel:STR(@"添加照片")];
        [tester swipeViewWithAccessibilityLabel:STR(@"房产信息列表") inDirection:KIFSwipeDirectionDown];
        [tester waitForViewWithAccessibilityLabel:STR(@"选择照片")];
        [tester tapRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0] inTableViewWithAccessibilityIdentifier:STR(@"房产信息表单")];
        [tester choosePhotoInAlbum:STR(@"相机胶卷") atRow:0 column:0];
        [tester tapViewWithAccessibilityLabel:STR(@"预览")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"继续")];
        [tester waitForAnimationsToFinish];
        [tester tapViewWithAccessibilityLabel:STR(@"发布")];
        [tester waitForTimeInterval:5];
        [tester waitForViewWithAccessibilityLabel:STR(@"发布成功")];
        [tester waitForAnimationsToFinish];
        [tester waitForViewWithAccessibilityLabel:STR(@"分享")];
        [tester waitForAnimationsToFinish];
    });
});

SpecEnd
