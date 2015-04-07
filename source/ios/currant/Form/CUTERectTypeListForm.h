//
//  CUTERectTypeListForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTERentAddressMapForm.h"
#import "CUTEEnum.h"

@interface CUTERectTypeListForm : CUTEForm

- (void)setRentTypeList:(NSArray *)rentTypeList;

- (CUTEEnum *)rentTypeAtIndex:(NSInteger)index;

@end
