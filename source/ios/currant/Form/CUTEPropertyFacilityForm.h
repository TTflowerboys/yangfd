//
//  CUTEPropertyFacilityForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEEnum.h"

@interface CUTEPropertyFacilityForm : CUTEForm

- (void)setAllIndoorFacilities:(NSArray *)indoorFacilities;

- (CUTEEnum *)getIndoorFacilityByKey:(NSString *)key;

- (void)setAllCommunityFacilities:(NSArray *)communityFacilities;

- (CUTEEnum *)getCommunityFacilityByKey:(NSString *)key;

@end
