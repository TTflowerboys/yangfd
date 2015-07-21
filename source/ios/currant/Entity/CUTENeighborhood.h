//
//  CUTENeighborhood.h
//  currant
//
//  Created by Foster Yin on 7/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"
#import "MTLJSONAdapter.h"

@interface CUTENeighborhood : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *name;

@property (strong, nonatomic) NSString *country;

@end
