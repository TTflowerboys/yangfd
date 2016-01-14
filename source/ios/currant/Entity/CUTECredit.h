//
//  CUTECredit.h
//  currant
//
//  Created by Foster Yin on 7/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"
#import "MTLJSONAdapter.h"

@interface CUTECredit : MTLModel <MTLJSONSerializing>

@property (nullable, strong, nonatomic) NSString *identifier;

@property (nullable, strong, nonatomic) NSString *type;

@property (nullable, strong, nonatomic) NSString *tag;

@property (nonatomic) int amount;

@end
