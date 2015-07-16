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
#import "CUTETicketForm.h"

@interface CUTEPropertyFacilityForm : CUTETicketForm

- (void)setAllIndoorFacilities:(NSArray *)indoorFacilities;

- (void)setSelectedIndoorFacilities:(NSArray *)selectedIndoorFacilities;

- (CUTEEnum *)getIndoorFacilityByKey:(NSString *)key;

- (void)setAllCommunityFacilities:(NSArray *)communityFacilities;

- (void)setSelectedCommunityFacilities:(NSArray *)selectedCommunityFacilities;

- (CUTEEnum *)getCommunityFacilityByKey:(NSString *)key;

@end
