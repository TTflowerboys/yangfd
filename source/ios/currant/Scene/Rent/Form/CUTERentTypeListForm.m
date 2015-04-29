//
//  CUTERectTypeListForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTypeListForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormRentTypeCell.h"
#import "CUTERentAddressMapViewController.h"
#import <NSArray+Frankenstein.h>
#import "CUTEEnum.h"

@interface CUTERentTypeListForm () {
    NSArray *_rentTypeList;
}

@end

@implementation CUTERentTypeListForm

- (NSString *)formKeyFromTitle:(NSString *)title {
    if ([title isEqualToString:@"单间"]) {
        return @"single";
    }
    else {
        return @"whole";
    }
}

- (NSArray *)fields {
    NSArray *array = [_rentTypeList map:^id(CUTEEnum *object) {
        return [NSMutableDictionary dictionaryWithDictionary:@{FXFormFieldKey: [self formKeyFromTitle:object.value], FXFormFieldTitle:object.value, FXFormFieldCell: [CUTEFormRentTypeCell class], FXFormFieldDefaultValue:object}];
    }];
    if (!IsArrayNilOrEmpty(array)) {
        [array[0] setObject:STR(@"房产类型") forKey:FXFormFieldHeader];
    }
    return array;
}

- (void)setRentTypeList:(NSArray *)rentTypeList {
    _rentTypeList = rentTypeList;
}

- (CUTEEnum *)rentTypeAtIndex:(NSInteger)index {
    return [_rentTypeList objectAtIndex:index];
}

@end
