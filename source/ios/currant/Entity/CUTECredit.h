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

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *type;

@property (strong, nonatomic) NSString *tag;

@property (nonatomic) int amount;

@end
