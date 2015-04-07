//
//  CUTERectTypeListForm.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERectTypeListForm.h"
#import "CUTECommonMacro.h"
#import "CUTEFormRentTypeCell.h"
#import "CUTERentAddressMapViewController.h"
#import <NSArray+Frankenstein.h>
#import "CUTEEnum.h"

@interface CUTERectTypeListForm () {
    NSArray *_rentTypeList;
}

@end

@implementation CUTERectTypeListForm

- (NSArray *)fields {
    NSArray *array = [_rentTypeList map:^id(CUTEEnum *object) {
        return [NSMutableDictionary dictionaryWithDictionary:@{FXFormFieldKey: object.value, FXFormFieldTitle:object.value, FXFormFieldCell: [CUTEFormRentTypeCell class], FXFormFieldViewController: [CUTERentAddressMapViewController class]}];
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
