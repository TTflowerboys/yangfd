//
//  CUTEPropertyInfoForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <FXForms.h>
#import "CUTEPropertyMoreInfoForm.h"
#import "CUTERentPriceForm.h"

@interface CUTEPropertyInfoForm : NSObject <FXForm>

@property (nonatomic, strong) UIImage *photo;
@property (nonatomic, copy) NSString *propertyType;
@property (nonatomic, assign) NSUInteger bedroom;
@property (nonatomic, assign) NSUInteger area;
@property (nonatomic, strong) CUTERentPriceForm *rentPrice;
@property (nonatomic, strong) CUTEPropertyMoreInfoForm *moreInfo;

@end
