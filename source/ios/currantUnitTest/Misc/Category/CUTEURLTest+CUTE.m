//
//  CUTEURLTest.m
//  currant
//
//  Created by Foster Yin on 6/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "NSURL+CUTE.h"
#import "CUTEConfiguration.h"

@interface CUTEConfiguration (Private) {

}

+ (void)setHost:(NSString *)theHost;

@end



SpecBegin(URL_CUTE_)

describe(@"WebURL", ^ {

    beforeAll(^{
        [CUTEConfiguration setHost:@"yangfd.com"];
    });

    it(@"should have correct scheme", ^ {
        NSURL *url = [NSURL WebURLWithString:@"/"];
        assertThat(url.scheme, equalTo(@"http"));

    });


    it(@"should have correct host", ^ {
        NSURL *url = [NSURL WebURLWithString:@"/"];
        assertThat(url.host, equalTo([CUTEConfiguration host]));
    });

    it(@"should have correct path", ^ {
        NSURL *url = [NSURL WebURLWithString:@"/"];
        assertThat(url.path, equalTo(@"/"));
    });
});

describe(@"yangfdURL",^{
    it(@"should have correct scheme", ^{
        NSURL *url = [NSURL YangfdURLWithString:@"/property-list"];
        assertThat(url.scheme, equalTo(@"yangfd"));
    });
});

describe(@"isHttpOrHttpsURL", ^{
    it(@"should recognize http", ^{
        NSURL *url = [NSURL URLWithString:@"http://www.baidu.com"];
        assertThatBool(url.isHttpOrHttpsURL, isTrue());
    });

    it(@"should recognize https", ^{
        NSURL *url = [NSURL URLWithString:@"https://www.baidu.com"];
        assertThatBool(url.isHttpOrHttpsURL, isTrue());
    });

    it(@"should filter out assets-library", ^{
        NSURL *url = [NSURL URLWithString:@"assets-library//www.baidu.com"];
        assertThatBool(url.isHttpOrHttpsURL, isFalse());
    });
});

describe(@"isEquivalent", ^{

    it(@"should ignore query", ^{
        NSURL *aURL = [NSURL URLWithString:@"http://www.baidu.com/"];
        NSURL *bURL = [NSURL URLWithString:@"http://www.baidu.com/?from=nb"];
        assertThatBool([aURL isEquivalent:bURL], isTrue());
    });

    it(@"should ignore fragment", ^{
        NSURL *aURL = [NSURL URLWithString:@"http://www.baidu.com/"];
        NSURL *bURL = [NSURL URLWithString:@"http://www.baidu.com/#top"];
        assertThatBool([aURL isEquivalent:bURL], isTrue());
    });

    it(@"should ignore query and fragment", ^{
        NSURL *aURL = [NSURL URLWithString:@"http://www.baidu.com/"];
        NSURL *bURL = [NSURL URLWithString:@"http://www.baidu.com/?from=nb#top"];
        assertThatBool([aURL isEquivalent:bURL], isTrue());
    });
});

SpecEnd
