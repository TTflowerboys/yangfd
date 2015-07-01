//
//  CUTEUsageManagerTest.m
//  currant
//
//  Created by Foster Yin on 6/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTEUsageRecorder.h"
#import "CUTECommonMacro.h"

SpecBegin(UsageManager)

describe(@"saveEnterForegroundTime", ^ {
    it(@"should save 10000 times", ^ {
        int count = 10000;
        NSDate *date = [NSDate new];
        TICK;
        for (int i = 0; i < count; i++)
        {
            [[CUTEUsageRecorder sharedInstance] saveEnterForegroundTime:date.timeIntervalSince1970 + i];
        }
        TOCK;
        
        NSUInteger days = [[CUTEUsageRecorder sharedInstance] getUsageDays];

    });
});

//TODO more test case

SpecEnd
