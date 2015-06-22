//
//  CUTEURLTest+Assets.m
//  currant
//
//  Created by Foster Yin on 6/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETestCommon.h"
#import "NSURL+Assets.h"



SpecBegin(URL_Assets_)

describe(@"isAssetURL", ^ {

    it(@"should recognize assets url", ^ {
        NSURL *url = [NSURL URLWithString:@"assets-library://aldjsfal"];
        assertThatBool(url.isAssetURL, isTrue());
    });
    
});

SpecEnd