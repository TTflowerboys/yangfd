//
//  NSURLRequest+Presentation.m
//  currant
//
//  Created by Foster Yin on 11/12/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "NSURLRequest+Debug.h"


@implementation NSURLRequest (Presentation)

- (NSString *)HTTPBodyPresentation {

    if (self.HTTPBody) {
        return [[NSString alloc] initWithData:self.HTTPBody encoding:NSUTF8StringEncoding];
    }
    return nil;
}

@end
