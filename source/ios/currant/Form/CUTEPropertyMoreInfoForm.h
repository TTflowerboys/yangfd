//
//  CUTEPropertyMoreInfoForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <FXForms.h>
#import "CUTEPropertyFacilityForm.h"

@interface CUTEPropertyMoreInfoForm : NSObject <FXForm>

@property (nonatomic, copy) NSString *propertyTitle;
@property (nonatomic, copy) NSString *propertyDescription;
@property (nonatomic, strong) CUTEPropertyFacilityForm *facility;
@property (nonatomic, copy) NSString *feature;

@end
