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
#import "CUTECity.h"


@interface CUTEAPICacheManager : NSObject

+ (instancetype)sharedInstance;

- (BFTask *)getEnumsByType:(NSString *)type;

- (BFTask *)getCountriesWithCountryCode:(BOOL)showCountryCode;

- (BFTask *)getCitiesByCountry:(CUTECountry *)country;

- (BFTask *)getNeighborhoodByCity:(CUTECity *)city;

- (BFTask *)getUploadCDNDomains;

- (BFTask *)refresh;

@property (nonatomic, readonly) NSArray *uploadCDNDomains;


@end
