//
//  CUTEPropertyMoreInfoForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEPropertyFacilityForm.h"
#import "CUTETicketForm.h"
#import "CUTEAreaForm.h"

@interface CUTEPropertyMoreInfoForm : CUTETicketForm

@property (nonatomic, copy) NSString *ticketTitle;
@property (nonatomic, copy) NSString *ticketDescription;
@property (strong, nonatomic) CUTEAreaForm *area;
@property (nonatomic, strong) CUTEPropertyFacilityForm *facility;
//@property (nonatomic, copy) NSString *feature;

@end
