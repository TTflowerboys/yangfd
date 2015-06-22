//
//  CUTEStringTest+CUTECDN.m
//  currant
//
//  Created by Foster Yin on 6/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "CUTEEnumManager.h"
#import "NSString+CUTECDN.h"

@interface CUTEEnumManager (Private)

- (void)setUploadCDNDomains:(NSArray *)uploadCDNDomains;

@end


SpecBegin(String_CUTECDN_)

describe(@"isCDNPathEqualToCDNPath", ^ {

    beforeAll(^{
        //just make fake data
        [[CUTEEnumManager sharedInstance] setUploadCDNDomains:@[@"static.yangfd.com", @"aws-s3.bbtechgroup.com"]];
    });

    it(@"should work on simple text compare", ^ {
        NSString *aStr = @"http://static.yangfd.com/sdfjajdfka";
        NSString *bStr = @"http://static.yangfd.com/sdfjajdfka";
        assertThatBool([aStr isCDNPathEqualToCDNPath:bStr], isTrue());
    });

    it(@"should work on different host text compare", ^ {
        NSString *aStr = @"http://static.yangfd.com/sdfjajdfka";
        NSString *bStr = @"http://aws-s3.bbtechgroup.com/sdfjajdfka";
        assertThatBool([aStr isCDNPathEqualToCDNPath:bStr], isTrue());
    });

    it(@"should filter out unknown host", ^ {
        NSString *aStr = @"http://static.yangfd.com/sdfjajdfka";
        NSString *bStr = @"http://aws-s3.gogogo.com/sdfjajdfka";
        assertThatBool([aStr isCDNPathEqualToCDNPath:bStr], isFalse());
    });

});

SpecEnd
