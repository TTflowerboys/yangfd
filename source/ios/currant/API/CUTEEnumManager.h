//
//  CUTEEnumManager.h
//  currant
//
//  Created by Foster Yin on 4/6/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <BBTRestClient.h>
#import <Bolts.h>
#import "CUTECountry.h"

@interface CUTEEnumManager : NSObject

+ (instancetype)sharedInstance;

- (BFTask *)getEnumsByType:(NSString *)type;

- (BFTask *)getCountries;

- (BFTask *)getCitiesByCountry:(CUTECountry *)country;

- (BFTask *)startLoadAllEnums;

@end
