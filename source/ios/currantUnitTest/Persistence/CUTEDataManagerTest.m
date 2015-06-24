//
//  CUTEDataManagerTest.m
//  currant
//
//  Created by Foster Yin on 6/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEDataManager.h"

@interface CUTEDataManager (Private)

- (void)setStore:(YTKKeyValueStore *)store;

@end


SpecBegin(DataManager)

beforeAll(^{
    YTKKeyValueStore *store = [[YTKKeyValueStore alloc] initWithDBWithPath:@"cute_test.db"];
    [[CUTEDataManager sharedInstance] setStore:store];
});

describe(@"clearUser", ^{
    [[CUTEDataManager sharedInstance] clearUser];
    assertThat([CUTEDataManager sharedInstance].user, equalTo(nil));
});

describe(@"saveUser", ^ {
    it(@"should be save success", ^ {
        [[CUTEDataManager sharedInstance] clearUser];
        CUTEUser *user = [CUTEUser new];
        user.identifier = RANDOM_UUID;
        [[CUTEDataManager sharedInstance] saveUser:user];
        assertThat([CUTEDataManager sharedInstance].user, notNilValue());

    });
    
});

SpecEnd
