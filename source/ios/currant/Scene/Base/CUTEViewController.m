//
//  CUTEViewController.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEViewController.h"
#import "NSURL+QueryParser.h"
#import "NSString+Encoding.h"

@implementation CUTEViewController

- (NSURL *)originalURL {
    NSDictionary *queryDictionary = [self.url queryDictionary];
    if (queryDictionary && queryDictionary[@"from"]) {
        return [NSURL URLWithString:[queryDictionary[@"from"] URLDecode]];
    }
    return self.url;
}

@end
