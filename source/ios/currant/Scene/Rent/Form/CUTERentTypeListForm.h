//
//  CUTERectTypeListForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEEnum.h"
#import "CUTETicketViewModelProtocol.h"

@interface CUTERentTypeListForm : CUTEForm <CUTETicketViewModelProtocol>

@property (strong, nonatomic) CUTEEnum *rentType;

@property (nonatomic) BOOL singleUseForReedit;

- (void)setRentTypeList:(NSArray *)rentTypeList;

- (CUTEEnum *)rentTypeAtIndex:(NSInteger)index;

@end
