//
//  CUTETrafficTime.h
//  currant
//
//  Created by Foster Yin on 11/10/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import "MTLModel.h"
#import <MTLJSONAdapter.h>
#import "CUTEEnum.h"
#import "CUTETimePeriod.h"

@interface CUTETrafficTime : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) CUTEEnum *type;

@property (strong, nonatomic) CUTETimePeriod *time;

@property (nonatomic) BOOL isDefault;

- (NSDictionary *)toParams;

@end
