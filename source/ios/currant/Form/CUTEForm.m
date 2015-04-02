//
//  CUTEForm.m
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormDefaultCell.h"

@implementation CUTEForm

- (NSArray *)fields {
    NSArray *fields = [self cuteFields];
//    NSMutableArray *retFields = [NSMutableArray array];
//
//    for (NSDictionary *field in fields) {
//        NSMutableDictionary *retField = nil;
//        if ([field isKindOfClass:[NSDictionary class]]) {
//            retField = [NSMutableDictionary dictionaryWithDictionary:field];
//        }
//        else if ([field isKindOfClass:[NSString class]]) {
//            retField = [NSMutableDictionary dictionaryWithObject:field forKey:FXFormFieldKey];
//        }
//
//        if (![retField objectForKey:FXFormFieldCell]) {
//            [retField setValue:[CUTEFormDefaultCell class] forKey:FXFormFieldCell];
//        }
//        [retFields addObject:retField];
//    }
//
//    return retFields;
    return fields;
}

- (NSArray *)cuteFields {
    return @[];
}

@end
